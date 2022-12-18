import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { ImageContainer, ProdutoContainer, ProdutoDetalhe } from "../../styles/pages/produto";

interface ProdutoProps {
	produto: {
		id: string,
		nome: string,
		imageURL: string,
		preco: string,
		descricao: string,
		precoPadraoID: string
	}
}

export default function Produto({ produto }: ProdutoProps) {
	async function handleCompraProduto() {
		try {
			const response = await axios.post('/api/checkoutSession',{
				precoPadraoID: produto.precoPadraoID
			})

			const { checkoutURL } = response.data;

			window.location.href = checkoutURL;

		} catch (err) {
			alert('Falha ao redirecionar ao checkout');
		}
	}

	return (
		<>
			<Head>
				<title>{produto.nome} | Ignite Shop</title>
			</Head>
			<ProdutoContainer>
				<ImageContainer>
					<Image src={produto.imageURL} width={520} height={520} alt=""/>
				</ImageContainer>
				<ProdutoDetalhe>
					<h1>{produto.nome}</h1>
					<span>{produto.preco}</span>

					<p>{produto.descricao}</p>

					<button onClick={handleCompraProduto}>
						Comprar agora
					</button>
				</ProdutoDetalhe>
			</ProdutoContainer>
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [
			{ params: { id:'prod_MkmrafkFz44Tct'} }
		],
		fallback: 'blocking'
	}
}

export const getStaticProps: GetStaticProps<any,{id: string}> = async ({ params }) => {
	const produtoId = params.id;

	const produto = await stripe.products.retrieve(produtoId,{
		expand: ['default_price']
	})

	const preco = produto.default_price as Stripe.Price

	return {
		props: {
			produto: {
				id: produto.id,
				nome: produto.name,
				imageURL: produto.images[0],
				preco: new Intl.NumberFormat('pt-BR',{
					style: 'currency',
					currency: 'BRL'
				}).format(preco.unit_amount! / 100),
				descricao: produto.description,
				precoPadraoID: preco.id
			}			
		},
		revalidate: 60 * 60 * 1, //1 hora
	}
}