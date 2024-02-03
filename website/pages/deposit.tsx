import dynamic from 'next/dynamic';

const ConnexComponentWithNoSSR = dynamic(
  () => import('../components/DepositComponent'),
  { ssr: false }
);

const ConnexPage = () => {
  return (

    <div>
      <h1>Deposit funds</h1>
      <ConnexComponentWithNoSSR />
    </div>
  );
};

export default ConnexPage;
