import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { ImageContainer, SucessoContainer } from "../styles/pages/sucesso";

interface SucessoProps {
	nomeCliente: string;
	produto: {
		nome: string;
		imageURL: string;
	}
}

export default function Sucesso({ nomeCliente, produto }: SucessoProps){
	return (
		<>
			<Head>
				<title>Compra efetuada | Ignite Shop</title>

				<meta name="robots" content="noindex" />
			</Head>

			<SucessoContainer>
				<h1>Compra efetuada!</h1>

				<ImageContainer>
					<Image src={produto.imageURL} width={130} height={145} alt=""/>
				</ImageContainer>

				<p>
					Uhuul <strong>{nomeCliente}</strong>, sua <strong>{produto.nome}</strong> já está a caminho da sua casa
				</p>
				<Link href="/">
					Voltar ao catálogo
				</Link>
			</SucessoContainer>
		</>
	)
}

export const getServerSideProps: GetServerSideProps =  async ({ query }) => {
	if(!query.session_id){
		return {
			redirect: {
				destination: '/',
				permanent: false
			}
		}
	}


	const sessionId = String(query.session_id);

	const session = await stripe.checkout.sessions.retrieve(sessionId,{
		expand: ['line_items','line_items.data.price.product']
	});

	const nomeCliente = session.customer_details.name;
	const produto = session.line_items.data[0].price.product as Stripe.Product;

	return {
		props: {
			nomeCliente,
			produto: {
				nome: produto.name,
				imageURL: produto.images[0]
			}
		}
	}
}