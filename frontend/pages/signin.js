import styled from 'styled-components';
import Signin from '../components/Signin';
import Signup from '../components/Signup';

const GridStyles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 2rem;
`;

export default function SigninPage() {
  return (
    <GridStyles>
      <Signin />
      <Signup />
    </GridStyles>
  );
}
