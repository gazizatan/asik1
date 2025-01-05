function gcd(a, b) {
    while (b !== 0) {
      let temp = b;
      b = a % b;
      a = temp;
    }
    return a;
}
  
function modInverse(a, m) {
    for (let i = 1; i < m; i++) {
      if ((a * i) % m === 1) {
        return i;
      }
    }
    return null;
}
  
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
}
function generateKeyPair() {
    let p, q, n, phi, e, d;
    
    while (true) {
      p = Math.floor(Math.random() * 100) + 50;
      q = Math.floor(Math.random() * 100) + 50;
      if (isPrime(p) && isPrime(q)) break;
    }
  
    n = p * q;
    phi = (p - 1) * (q - 1);
  
    e = 3;
    while (gcd(e, phi) !== 1) {
      e++;
    }
  
    d = modInverse(e, phi);
  
    const publicKey = { n, e };
    const privateKey = { n, d };
  
    return { publicKey, privateKey };
}
function encrypt(publicKey, message) {
    const { n, e } = publicKey;
    let encryptedMessage = '';
    for (let i = 0; i < message.length; i++) {
      const m = message.charCodeAt(i);
      const c = Math.pow(m, e) % n;
      encryptedMessage += String.fromCharCode(c);
    }
    return encryptedMessage;
}
  
function decrypt(privateKey, encryptedMessage) {
    const { n, d } = privateKey;
    let decryptedMessage = '';
    for (let i = 0; i < encryptedMessage.length; i++) {
      const c = encryptedMessage.charCodeAt(i);
      const m = Math.pow(c, d) % n;
      decryptedMessage += String.fromCharCode(m);
    }
    return decryptedMessage;
}
  