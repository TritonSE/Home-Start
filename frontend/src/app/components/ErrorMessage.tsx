import Image from "next/image";

import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className={styles.error}>
      <Image src="/error_symbol.svg" alt="error" width={20} height={20} />
      {message}
    </div>
  );
}
