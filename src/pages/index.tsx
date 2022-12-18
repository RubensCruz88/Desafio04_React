import { HomeContainer, Produto } from "../styles/pages/home";

import Image from "next/image";
import Head from 'next/head';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { stripe } from "../lib/stripe";
import { GetStaticProps } from "next";
import Stripe from "stripe";
import Link from "next/link";

interface HomeProps {
	produtos: {
		id: string,
		nome: string,
		imageURL: string,
		preco: string
	}[]
}

export default function Home( { produtos }: HomeProps) {
	const [sliderRef] = useKeenSlider({
		slides: {
			perView: 3,
			spacing: 48
		}
	})

	return (
		<>
			<Head>
				<title>Home | Ignite Shop</title>
			</Head>

			<HomeContainer ref={sliderRef} className="keen-slider">
				{produtos.map(produto => {
					return (
						<Link href={`/produto/${produto.id}`} key={produto.id} prefetch={false}>
							<Produto  className="keen-slider__slide">
								<Image src={produto.imageURL} width={520} height={520} alt=""/>
				
								<footer>
									<strong>{produto.nome}</strong>
									<span>{produto.preco}</span>
								</footer>
							</Produto>
						</Link>
					)
				})}

			</HomeContainer>
		</>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const response = await stripe.products.list({
		expand: ['data.default_price']
	});


	const produtos = response.data.map(produto => {
		const preco = produto.default_price as Stripe.Price

		return {
			id: produto.id,
			nome: produto.name,
			imageURL: produto.images[0],
			preco: new Intl.NumberFormat('pt-BR',{
				style: 'currency',
				currency: 'BRL'
			}).format(preco.unit_amount! / 100)
		}
	})
	
	return {
		props: {
			produtos
		}
	}
}