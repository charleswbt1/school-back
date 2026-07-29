const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const Repository = require('../repositories/repository');
const PaymentDto = require('../dto/payment-dto.js');

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
        const { student_id, amount, year, month, type } = req.body;
        const student = await Repository.getById(student_id, 'students');
        const user = await Repository.getById(student.user_id, 'users');
        const team = await Repository.getById(user.team_id, 'teams');
        const applicationFee = amount * 1;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            payment_intent_data: {
                application_fee_amount: applicationFee,
                transfer_data: {
                    destination: team.stripe_id
                }
            },
            line_items: [
                {
                    price_data: {
                        currency: "mxn",
                        product_data: {
                            name: 'IUC Conecta',
                            description: type
                        },
                        unit_amount: amount * 100
                    },
                    quantity: 1
                }
            ],
            success_url: `https://iuc-conecta.com/home/success.html?student_id=${student_id}`,
            cancel_url: 'https://iuc-conecta.com/home/result.html?state=cancel'
        });
        const payment = await Repository.create({
            stripe_id: session.id,
            stripe_data: session,
            student_id: student_id,
            amount: amount,
            year: year,
            month: month,
            type: type
        }, 'payments');
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;