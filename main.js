const bitcoin = require('bitcoinjs-lib');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
const readline = require('readline');

console.clear();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const btcArt = `
\x1b[38;2;250;128;114m
╔════════════════════════════════════════════════════════╗
║\x1b[0m\x1b[36m   ____ _____ ____   _____ ___ _   _ ____  _____ ____   \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  | __ )_   _/ ___| |  ___|_ _| \\ | |  _ \\| ____|  _ \\  \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  |  _ \\ | || |     | |_   | ||  \\| | | | |  _| | |_) | \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  | |_) || || |___  |  _|  | || |\\  | |_| | |___|  _ <  \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m  |____/ |_| \\____| |_|   |___|_| \\_|____/|_____|_| \\_\\ \x1b[0m\x1b[38;2;250;128;114m║
║\x1b[0m\x1b[36m                                                        \x1b[0m\x1b[38;2;250;128;114m║
╚═══\x1b[32m════════════════════DiegoDev - RandomSearch═══════\x1b[0m\x1b[38;2;250;128;114m═══╝\x1b[0m`;

console.log(btcArt);

rl.question('Cole o endereço da Carteira: ', (chavePublicaInput) => {
    chavePublica = chavePublicaInput; 
    rl.question('Cole o minKey: ', (minKey) => {
        rl.question('Cole o maxKey: ', (maxKey) => {
            rl.question('Deseja iniciar?: (S) ou (N): ', (answer) => {
                if (answer.toLowerCase() === 's') {
                    console.log('Iniciando a busca...');
                    const minKeyBigInt = BigInt(`0x${minKey}`);
                    const maxKeyBigInt = BigInt(`0x${maxKey}`);
                    if (minKeyBigInt >= maxKeyBigInt) {
                        console.log('Erro: minKey deve ser menor que maxKey.');
                        rl.close();
                    } else {
                        findPrivateKey(chavePublica, minKeyBigInt, maxKeyBigInt);
                    }
                } else {
                    console.log('Operação cancelada.');
                    rl.close();
                }
            });
        });
    });
});

let chavePublica = "";


function getRandomPrivateKey(min, max) {
    const range = max - min;
    const randomOffset = BigInt('0x' + crypto.randomBytes(16).toString('hex')) % range;
    return min + randomOffset;
}

function checkAddress(privateKeyHex) {
    try {
        const key = ec.keyFromPrivate(privateKeyHex);
        const publicKey = key.getPublic(true, 'hex'); // compressed public key
        const { address } = bitcoin.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') });
        return address === chavePublica;
    } catch (error) {
        console.error(`Erro ao verificar chave privada: ${error.message}`);
        return false;
    }
}
//função antiga com bug ao cancelar processo.
// function findPrivateKey(chavePublica, minKey, maxKey) {
//   let attempts = 0;
  
//   while (!stop) {
//     const privateKey = getRandomPrivateKey(minKey, maxKey);
//     const privateKeyHex = privateKey.toString(16).padStart(64, "0");
//     attempts++;

//     console.log(`Tentativa #${attempts}: Chave gerada: ${privateKeyHex}`);

//     if (checkAddress(privateKeyHex)) {
//       console.log(`
//                 ╔════════════════════════════════════════════════════════════════════════╗
//                 ║ CHAVE PRIVADA ENCONTRADA:                                              ║
//                 ║ ${privateKeyHex}       ║
//                 ╚════════════════════════════════════════════════════════════════════════╝
//                 `);
//       console.log(`Tentativas randômicas: ${attempts}`);
//       rl.close();
//       process.exit();
//       return privateKeyHex;
//     }

//     if (attempts % 100000 === 0) {
//       console.log(`Tentativas: ${attempts}`);
//     }
//   }

//   rl.close();
// }

let stop = false;

process.on('SIGINT', () => {
  stop = true;
  // process.exit();
});

// Função assíncrona que permite esperar por um curto período de tempo
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findPrivateKey(chavePublica, minKey, maxKey) {
    let attempts = 0;
  
    while (!stop) {
      const privateKey = getRandomPrivateKey(minKey, maxKey);
      const privateKeyHex = privateKey.toString(16).padStart(64, "0");
      attempts++;
  
      console.log(`Tentativa #${attempts}: Chave gerada: ${privateKeyHex}`);
  
      if (checkAddress(privateKeyHex)) {
        console.log(`
                  ╔════════════════════════════════════════════════════════════════════════╗
                  ║ CHAVE PRIVADA ENCONTRADA:                                              ║
                  ║ ${privateKeyHex}       ║
                  ╚════════════════════════════════════════════════════════════════════════╝
                  `);
        console.log(`Tentativas randômicas: ${attempts}`);
        rl.close();
        process.exit();
        return privateKeyHex;
      }
  
      if (attempts % 100000 === 0) {
        console.log(`Tentativas: ${attempts}`);
      }
  
      await delay(0);
    }
  
    console.log('Processo interrompido.');
  }

