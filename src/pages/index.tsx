import Head from 'next/head';
import { TableCountryInformation } from '../components/TableCountryInformation'
import { LineChart } from '../components/LineChart'
import styles from '../styles/pages/Home.module.css'

interface HomeProps {
}

export default function Home(props: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Line Chart</title>
        <meta name="title" content="D3 Line" />
        <meta name="description" content="D3 Line Chart" />
      </Head>
      <TableCountryInformation />
      <LineChart
        width={400}
        height={300}
      />
    </div>
  )
}