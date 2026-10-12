const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
// Load the installed package variant with the tracked pnpm patch.
function patched(name) {
 const directory = fs.readdirSync('node_modules/.pnpm').find(p => p.startsWith(name+'@') && p.includes('patch_hash='));
 assert.ok(directory, 'Installed patch missing: '+name);
 return require(path.resolve('node_modules/.pnpm', directory, 'node_modules', name));
}
const braces = patched('braces');
assert.deepEqual(braces.expand('a/{b,c}/d'), ['a/b/d','a/c/d']);
assert.throws(() => braces('{'.repeat(1000)+'a'+ '}'.repeat(1000)), /maximum depth/);
const forge = patched('node-forge');
const {publicKey,privateKey} = crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const pub = forge.pki.publicKeyFromPem(publicKey.export({type:'spki',format:'pem'}));
const message = Buffer.from('dependency regression');
const digest = crypto.createHash('sha256').update(message).digest();
const signature = crypto.sign('sha256', message, privateKey);
assert.equal(pub.verify(digest.toString('binary'),signature.toString('binary')),true);
const a = forge.asn1;
// Build a valid DigestInfo or one with an extra nested algorithm element.
function der(extra) {
 const algorithm=[a.create(a.Class.UNIVERSAL,a.Type.OID,false,a.oidToDer(forge.pki.oids.sha256).getBytes()),a.create(a.Class.UNIVERSAL,a.Type.NULL,false,'')];
 if(extra) algorithm.push(a.create(a.Class.UNIVERSAL,a.Type.NULL,false,''));
 return Buffer.from(a.toDer(a.create(a.Class.UNIVERSAL,a.Type.SEQUENCE,true,[a.create(a.Class.UNIVERSAL,a.Type.SEQUENCE,true,algorithm),a.create(a.Class.UNIVERSAL,a.Type.OCTETSTRING,false,digest.toString('binary'))])).getBytes(),'binary');
}
const normal=crypto.privateEncrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_PADDING},der(false));
assert.equal(pub.verify(digest.toString('binary'),normal.toString('binary')),true);
const malformed=crypto.privateEncrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_PADDING},der(true));
assert.throws(()=>pub.verify(digest.toString('binary'),malformed.toString('binary')), /DigestInfo/);
console.log('Security regression checks passed: normal braces/signatures work; nested brace and DigestAlgorithm attacks rejected.');
