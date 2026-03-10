import { Twilio } from "twilio";

import { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } from "../config";

import type { MessageInstance } from "twilio/lib/rest/conversations/v1/conversation/message";

const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);

const CONVERSATION_SID_REGEX = /CH[0-9a-fA-F]{32}/;

async function createConversationTwilio(friendlyName: string): Promise<string> {
  const conversation = await twilioClient.conversations.v1.conversations.create({
    friendlyName,
  });

  return conversation.sid;
}

async function createConversationMessageTwilio(
  ConversationSid: string,
  body: string,
  author: string,
): Promise<MessageInstance> {
  const message = await twilioClient.conversations.v1
    .conversations(ConversationSid)
    .messages.create({
      body,
      author,
    });

  return message;
}

async function getMessageDeliveryReceipts(
  conversationSid: string,
  messageSid: string,
): Promise<void> {
  const receipts = await twilioClient.conversations.v1
    .conversations(conversationSid)
    .messages(messageSid)
    .deliveryReceipts.list();

  console.info("Detailed delivery receipts:");
  receipts.forEach((receipt) => {
    console.info({
      participantSid: receipt.participantSid,
      status: receipt.status,
      errorCode: receipt.errorCode,
      channelMessageSid: receipt.channelMessageSid,
      dateUpdated: receipt.dateUpdated,
    });
  });
}

async function createConversationParticipantTwilio(
  ConversationSid: string,
  participantPhoneNumber: string,
): Promise<string> {
  try {
    // Make sure that the twilioPhoneNumber is added
    // As a projected address
    if (participantPhoneNumber === twilioPhoneNumber) {
      await twilioClient.conversations.v1.conversations(ConversationSid).participants.create({
        identity: "HomeStartBot",
        "messagingBinding.projectedAddress": twilioPhoneNumber,
      });
      return ConversationSid;
    }
    await twilioClient.conversations.v1.conversations(ConversationSid).participants.create({
      "messagingBinding.address": participantPhoneNumber,
    });
  } catch (error) {
    // The participant is already in the conversation
    // No need to do anything
    if ((error as { code: number }).code === 50433) {
      // console.log("error 50433");
      return ConversationSid;
    }

    // The exact conversation SID already exists
    // So we need to extract it from the error message and use it
    if ((error as { code: number }).code === 50438) {
      // console.log("error 50438");
      const sidMatch = CONVERSATION_SID_REGEX.exec((error as { message: string }).message);
      if (sidMatch) {
        return sidMatch[0];
      }
    }
    throw error;
  }
  return ConversationSid;
}

type ParticipantLike = {
  messagingBinding?: {
    address?: string | null;
  };
};

async function listConversationParticipantAddresses(conversationSid: string): Promise<string[]> {
  const participants = await twilioClient.conversations.v1
    .conversations(conversationSid)
    .participants.list();

  return (participants as ParticipantLike[])
    .map((participant) => {
      return participant.messagingBinding?.address;
    })
    .filter((address): address is string => Boolean(address));
}

async function ensureConversationHasParticipants(
  conversationSid: string,
  volunteerPhoneNumbers: string[],
  retriesLeft: number,
): Promise<string> {
  if (retriesLeft <= 0) {
    return conversationSid;
  }

  const currentParticipants = new Set(await listConversationParticipantAddresses(conversationSid));
  const missingParticipants = volunteerPhoneNumbers.filter(
    (phoneNumber) => !currentParticipants.has(phoneNumber),
  );

  if (missingParticipants.length === 0) {
    return conversationSid;
  }

  // We need to await promises in a loop, but not in parallel
  // Since the conversation SID is dependant on the previous participant being added in some cases
  const nextConversationSid = await missingParticipants.reduce<Promise<string>>(
    async (sidPromise, phoneNumber) => {
      const sid = await sidPromise;
      return await createConversationParticipantTwilio(sid, phoneNumber);
    },
    Promise.resolve(conversationSid),
  );

  return ensureConversationHasParticipants(
    nextConversationSid,
    volunteerPhoneNumbers,
    retriesLeft - 1,
  );
}

async function createVolunteerConversationTwilio(
  volunteerPhoneNumbers: string[],
  initialMessage: string,
  chatFriendlyName?: string,
): Promise<string> {
  const uniqueVolunteerPhoneNumbers = [...new Set([...volunteerPhoneNumbers, twilioPhoneNumber])];

  let conversationSid = await createConversationTwilio(
    chatFriendlyName ??
      `Chat with ${volunteerPhoneNumbers[0]}${volunteerPhoneNumbers.length > 1 ? ` and ${volunteerPhoneNumbers.length - 1} others` : ""}`,
  );

  conversationSid = await ensureConversationHasParticipants(
    conversationSid,
    uniqueVolunteerPhoneNumbers,
    3,
  ).catch((error) => {
    console.error("Error ensuring conversation has participants:", error);
    return conversationSid;
  });

  console.info(
    "SID has participants:",
    (await listConversationParticipantAddresses(conversationSid)).join(", "),
  );

  console.info("Created conversation with SID:", conversationSid);

  const message = await createConversationMessageTwilio(
    conversationSid,
    initialMessage,
    "HomeStartBot",
  ).catch((error) => {
    console.error("Error sending initial message in conversation:", error);
  });

  console.log("Sent initial message with SID:", message);

  if (message?.sid) {
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
    await getMessageDeliveryReceipts(conversationSid, message.sid);
  }

  return conversationSid;
}

async function testTwilio() {
  createVolunteerConversationTwilio(
    ["+14155426904", "+14089308512"],
    "Does this even show up in the message logs?",
  ).catch((error) => {
    console.error("Error creating volunteer conversation:", error);
  });
}

testTwilio().catch(console.error);

export {
  createConversationMessageTwilio,
  createConversationParticipantTwilio,
  createConversationTwilio,
  createVolunteerConversationTwilio,
  getMessageDeliveryReceipts,
};
