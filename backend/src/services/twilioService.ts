import { Twilio } from "twilio";

import { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } from "../config";

import type { ConversationInstance } from "twilio/lib/rest/conversations/v1/conversation";
import type { MessageInstance } from "twilio/lib/rest/conversations/v1/conversation/message";
import type { ParticipantInstance } from "twilio/lib/rest/conversations/v1/conversation/participant";

const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);

async function createConversation(friendlyName: string): Promise<ConversationInstance> {
  const conversation = await twilioClient.conversations.v1.conversations.create({
    friendlyName,
  });

  return conversation;
}

type MessageInfo = {
  body: string;
  author: string;
};

async function createConversationMessage(
  ConversationSid: string,
  info: MessageInfo,
): Promise<MessageInstance> {
  const message = await twilioClient.conversations.v1
    .conversations(ConversationSid)
    .messages.create({
      author: info.author,
      body: info.body,
    });

  return message;
}

async function createConversationParticipant(
  ConversationSid: string,
  participantPhoneNumber: string,
): Promise<ParticipantInstance> {
  const participant = await twilioClient.conversations.v1
    .conversations(ConversationSid)
    .participants.create({ "messagingBinding.address": participantPhoneNumber });

  return participant;
}

async function createChatWithVolunteer(
  volunteerPhoneNumber: string,
  initialMessage: string,
  chatFriendlyName?: string,
  authorName = "Home-Start",
) {
  const conversation = await createConversation(
    chatFriendlyName ?? `Chat with ${volunteerPhoneNumber}`,
  );

  await createConversationParticipant(conversation.sid, volunteerPhoneNumber);

  await createConversationMessage(conversation.sid, {
    body: initialMessage,
    author: authorName,
  });
}

export {
  createChatWithVolunteer,
  createConversation,
  createConversationMessage,
  createConversationParticipant,
};
