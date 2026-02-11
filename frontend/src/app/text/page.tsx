"use client";
import { sendPersonalized } from "../email";
import { getGraphToken, initMsal } from "../signing";

export default function Text() {
  async function handleSend() {
    await initMsal(); // ensure redirect is processed + account set
    const token = await getGraphToken();
    await sendPersonalized(token, [
      { email: "charlie.suarez.robles@gmail.com", name: "Charlie" },
      { email: "charlie.suarez.robles@outlook.com", name: "Brian" },
      /* Here you place the emails and the names of the people your are sending the email to*/
    ]);
  }

  return (
    <div>
      <button onClick={handleSend}>Send Emails</button>
    </div>
  );
}
