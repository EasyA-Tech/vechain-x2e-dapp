import dynamic from 'next/dynamic';

const StepperComponent = dynamic(
  () => import('../components/EarnComponent'),
  { ssr: false }
);

const ConnexPage = () => {
  return (

    <div>
      <h1>Earn</h1>
      <StepperComponent />
    </div>
  );
};

export default ConnexPage;
