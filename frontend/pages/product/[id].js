import SingleProduct from '../../components/SingleProduct';

export default function SimpleProductPage({ query }) {
  return <SingleProduct id={query.id} />;
}
