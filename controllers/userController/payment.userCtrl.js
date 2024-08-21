const UserPayment = require('../../models/userModel/payment.userModel');

exports.CreatePayment = async (req, res) => {
    try {
        const { userId, category, subscriptionType, plan, price } = req.body;

        if (!userId || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "userId, category and price are required",
            });
        };
        const payment = new UserPayment({
            userId,
            category,
            subscriptionType,
            plan,
        });
        await payment.save();

        res.status(201).json({
            success: true,
            message: "Payment successfull...",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error occured while creating the payment",
        });
    };
};