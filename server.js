 import express from "express";
 import dotenv from "dotenv";
 import stripe from "stripe";
 
 //load variables
 dotenv.config();
 
 //start server
 const app = express();
  app.use(express.static("public"));
  app.use(express.json());
  //Home route
  app.get("/",(req, res) => {
     res.sendFile("shops.html",{root:"public"});
  });
  //success
  app.get("/success",(req, res) => {
    res.sendFile("success.html",{root:"public"});
 });
  //failure
  app.get("/cancel",(req, res) => {
    res.sendFile("cancel.html",{root:"public"});
 });
 
  //stripe 
  let stripeGateway = stripe(process.env.stripe_api);
  let DOMAIN = process.env.DOMAIN;
  app.post("/stripe-checkout", async (req, res) => {
    const lineItems = req.body.items.map((item) => {
       const unitAmount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
       console.log("item-price:", item.price);
       console.log("unitAmount:", unitAmount);
       console.log("item.productImg:", item.productImg);

       return{         
          price_data: {
             currency: "inr",
             product_data: {
                name: item.title,
                images: [item.productImg],
             },
             unit_amount: unitAmount,
          },
          quantity: item.quantity,
       };
    });
    console.log("lineItems:",lineItems);
 
    //ceate checkout session
    const session = await stripeGateway.checkout.sessions.create({
       payment_method_types: ["card"],
       mode: "payment",
       success_url: `${DOMAIN}/success`,
       cancel_url: `${DOMAIN}/cancel`,
       line_items: lineItems,
       //asking address in stripe checout page
       billing_address_collection: "required",
    });
    res.json(session.url);
  });
  app.listen(3000, () => {
     console.log("listening on port 3000;");
  });
 