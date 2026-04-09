const ENCRYPTION_KEY = "super-secret-key";

const getKey = async () => {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encrypt = async (data: unknown): Promise<string> => {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const encoded = enc.encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return btoa(
    JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    })
  );
};

export const decrypt = async (cipherText: string): Promise<string | null> => {
  try {
    const dec = new TextDecoder();
    const parsed = JSON.parse(atob(cipherText));
    const iv = new Uint8Array(parsed.iv);
    const data = new Uint8Array(parsed.data);
    const key = await getKey();

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return JSON.parse(dec.decode(decrypted));
  } catch (e) {
    console.error("Decryption error:", e);
    return null;
  }
};
