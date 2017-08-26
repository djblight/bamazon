var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "1@Dra2@Aus3",
  database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  // start();
});

// Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
function itemPurchase() {
    // query the database for all items listed for sale
    connection.query("SELECT * FROM products", function(err, results) {
      if (err) throw err;
      // once you have the items, prompt the user for which they'd like to purchase
      // inquirer
      inquirer
      .prompt([
        {
          name: "productId",
          type: "input",
          message: "What is the ID of the item you would like to purchase?"
        },
        {
          name: "buyUnits",
          type: "input",
          message: "How many units would you like to purchase?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
              return false;
            }
          }  
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        // determine if stock quantity available is high enough
        if (chosenItem.stock_quantity < parseInt(answer.buyUnits)) {
          // if stock quantity is high enough, update db, let the user know, and show total coat of order
          connection.query(
            "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: answer.buyUnits
              },
              {
                id: chosenItem.productId
              }
            ],
            function(error) {
              if (error) throw err;
              var total = (answer.quantity * chosenItem.price);
              console.log("Order placed successfully! Your order total is " + total);
              start();
            }
          );
        }
        else {
          // stock quantity wasn't high enough, so apologize and start over
          console.log("Your desired item is not instock, but you can order a different item...");
          start();
        }
      })
    })
}