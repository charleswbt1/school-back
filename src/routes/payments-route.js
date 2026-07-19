const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');

router.post('/account', async (req, res) => {
    try {
        const { school_id, school_email } = req.body;
        if (!school_email || !school_id) {
            throw new Error(`campos faltantes`)
        }
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'MX',
            email: school_email,
            business_type: 'company',
            capabilities: {
                card_payments: {
                    requested: true
                },
                transfers: {
                    requested: true
                }
            },
            metadata: {
                school_id
            }
        });
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: "http://localhost:3001/home/success.html",
            return_url: "http://localhost:3001/home/result.html",
            type: "account_onboarding"
        });

        res.json({
            url: accountLink.url
        });
    } catch (error) {
        res.status(500).json(error);
    }
});
router.post('/checkout', async (req, res) => {
    try {
        const { name, description, amount, schoolStripeAccountId } = req.body;
        const applicationFee = amount * 1;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            payment_intent_data: {
                application_fee_amount: 5000,
                transfer_data: {
                    destination: schoolStripeAccountId
                }
            },
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        product_data: {
                            name,
                            description
                        },
                        unit_amount: amount * 100
                    },
                    quantity: 1
                }
            ],
            success_url: 'http://localhost:3001/home/success.html',
            cancel_url: 'http://localhost:3001/home/result.html?state=cancel'
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;