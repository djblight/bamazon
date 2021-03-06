var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

// Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.
function start() {

    //Query products, id, and prices to display to customer
    connection.query("SELECT item_id, product_name, price FROM products", function (error, data) {
        if (error) {
            return console.log("Error!");
        }
        for (var i = 0; i < data.length; i++) {
            var list = "ID. #" + data[i].item_id + " || Item: " + data[i].product_name + ", $" + data[i].price;
            console.log(list);
        }
        service();
    });
}

function service() {
    //Beginning of a prompt asking the user if they would like to continue or not.

    inquirer.prompt([{
            name: "id",
            message: "What is the ID of the item you want to buy?",
            type: "input"
        },
        {
            name: "desiredQuantity",
            message: "How many units would you like to buy of this item?",
            type: "input"
        }
    ]).then(function (response) {
        var id = response.id;
        var desiredQuantity = response.desiredQuantity;

        //Check if there is enough in stock of the item using parameters
        check(id, desiredQuantity);
    });


}

function check(id, desiredQuantity) {
    connection.query("SELECT stock_quantity, price FROM products WHERE ?", {
        item_id: id
    }, function (error, data) {
        if (error) {
            return console.log("Error!");
        }

        var inStock = parseInt(data[0].stock_quantity);
        var price = parseFloat(data[0].price);

        if (desiredQuantity <= inStock) {
            var totalPrice = price * desiredQuantity;
            var inStock = inStock - desiredQuantity;

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: inStock
            }, {
                item_id: id
            }], function (error, data) {
                if (error) {
                    return console.log("Error!");
                }
            });

            console.log("Purchase successful! Your total price is: $" + totalPrice.toFixed(2));
            keepShopping();

        } else {
            console.log("Insufficient quantity!");
            keepShopping();
        }
    });
}

function keepShopping() {
    inquirer.prompt({
            name: "continue",
            type: "confirm",
            message: "Would you like to keep shopping?"
        })
        .then(function (answer) {
            //If they answer yes then restart the entire application
            if (answer.continue === 'Y') {
                start();
            //If the answer is anything else exit out of the application
            } else {
                process.exit();
            }
        });
}