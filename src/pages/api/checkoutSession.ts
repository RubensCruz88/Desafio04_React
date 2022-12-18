import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { precoPadraoID } = req.body;

	const successUrl = `${process.env.NEXT_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`
	const cancelUrl = `${process.env.NEXT_URL}/`

	const checkoutSession = await stripe.checkout.sessions.create({
		cancel_url: cancelUrl,
		success_url: successUrl,
		mode: 'payment',
		line_items: [
			{
				price: precoPadraoID,
				quantity: 1
			}
		]
	})

	return res.status(201).json({
		checkoutURL: checkoutSession.url
	})
}