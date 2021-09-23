import { useUser } from './User';
import Signin from './Signin';

export default function PleaseSignin({ children }) {
  const me = useUser();
  if (!me) {
    return <Signin />;
  }

  return children;
}
