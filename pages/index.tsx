// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
import Head from 'next/head';
import { Recover } from '@/modules/recover';

export default function Home() {
  return (
    <>
      <Head>
        <title>Token Recover Self-Service Tools | BNB Chain</title>
        <meta name="description" content="Recover BEP2/BEP8 tokens from BNB Beacon Chain to BNB Chain" />
      </Head>
      <Recover />
    </>
  );
}
