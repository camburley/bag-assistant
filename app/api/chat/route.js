import React, { useContext } from "react";
import { ChatOpenAI } from "langchain/chat_models/openai"
import { CallbackManager } from "langchain/callbacks"
import { NextRequest, NextResponse } from "next/server"
import { DataContext } from '../../../context/DataContext';
import formatMessages from "../../../helpers/langchainFormat"

export const runtime = "edge"
export const preferredRegion = "auto"

const style = [
        {
            "conversation_id": "1",
            "userMessage": "Hi there. I want to process some anxiety I've been feeling. My boyfriend is incredible and great but I'm always worried he doesn't actually love me or he's going to leave me for some reason. I panic and get frustrated about things and feel like I'm just crazy all the time. I don't want to sabotage this. I want to make this work.",
            "response": "I'm glad you reached out for help, and I hope these journaling questions can provide you with guidance and insight as you process your anxiety. Here are some options for reflection. Answer one of the questions below that feels relevant: \n \n"
        },
        {
            "conversation_id": "1",
            "userMessage": "Well my last ex cheated on me. He was super abusive and narcissistic and it was awful. I was with him too long and too insecure to break up with him. I don't want to repeat that. I also don't want to punish my current boyfriend for stuff he didn't do. How do I break free from this?",
            "response": "Thank you for sharing your experience with your past relationship. It’s admirable that you have the presence and capacity to acknowledge the impact that it had on you. Here's a question to help you further explore and draw connections: \n \n"
        },
        {
            "conversation_id": "1",
            "userMessage": "Well when he cheated on me I was devastated. I knew something was going on. He would never let me see his phone or have his passcode and was always super vague about other girls. My new boyfriend isn’t like that but for some reason I’m having such a hard time trusting him. Like, I want to be able to let that go and I know he’s great. But I just can’t get the thoughts to go away.",
            "response": "Thank you for sharing more about your past experience. It sounds like you’re tuning into the impact your ex had on your ability to trust. Here's a question to help you delve deeper and gain insight:"
        },
        {
            "conversation_id": "1",
            "userMessage": "Well my mom was always super anxious. I guess that’s where I get it from. Maybe that’s why I’m anxious. I guess that just means I’m just like this. ",
            "response": "That’s a meaningful insight. I’m also picking up that this connection feels a bit discouraging. Let’s explore this further to see if we can add some clarity and maybe even a step forward. Here's a question to help you further explore this connection and consider how you might shape your own path: \n \n",
        },
        {
            "conversation_id": "2",
            "userMessage": "Hi, I'm struggling with anxiety and depression. I've been in therapy before, but it hasn't really helped me.",
            "response": "I’m sorry to hear you’ve been struggling. Happy to help you reflect on this. Tell me a bit more about what you’re struggling with? I’ll be more helpful with more context. "
        },
        {
            "conversation_id": "2",
            "userMessage": "Well. I feel like everything is just so overwhelming and pointless. Like nothing I do makes anything better. I have a kid that’s a brat and doesn't listen. I am genuinely horrified by the thoughts that go through my brain about how much I don’t like her. I guess that makes me an awful parent. I try everything through and nothing works. I know there’s some trauma with my mom. I grew up in a home where I really wasn’t allowed to be myself. Like I had to be the perfect princess or I would just get lambasted by my parents for being bad. I feel like I don’t really know myself all that well and I’m just repeating the patterns for my kid that I went though and I feel terrible for it. ",
            "response": "It sounds like you really want to give your child a better childhood than you had, I admire and respect that. Here’s a couple questions to help with getting in touch with your feelings about yourself as a parent and how your upbringing may be affecting your current struggle: \n \n"
        },
        {
            "conversation_id": "2",
            "userMessage": "Gosh. I don’t know the last time I felt connected to my true self. I don’t even know what my true self is. All I know is what’s expected of me and what people want from me and how much I’m failing.",
            "response": "It's completely understandable that you're struggling to connect with your true self when you've been focused on fulfilling the expectations of others for so long. It can be challenging to break free from those patterns and rediscover who you truly are: \n \n"
        },
        {
            "conversation_id": "2",
            "userMessage": "She’s really artistic and likes to put on plays and dance all the time. She’s so repetitive though, it drives me crazy. Maybe it’s the age. Like she wants to play dolly’s and she just wants to have them take a bath and get ready over and over. Like I don’t know what you want me to do. How long can this possibly go on?! Then I feel like crap for being so irritated when she just wants to play with me. Like what kind of terrible mother am I?!",
            "response": "It’s normal to find repetitive play boring and uninteresting, the fact that you feel this way and still have moments where you attempt to press in and play anyways shows me you really care about her. Here’s some questions to get to the bottom of why this could be: \n \n"
        },
        {
            "conversation_id": "2",
            "userMessage": "Oh. My parents never really played with me. I would always play with my brother growing up but he was violent and intense and I always hated playing with him. He was so mean and would pick on me. I would normally try and play with other girls growing up but I would just do what they wanted to do. I never really paid attention to what I wanted.",
            "response": "It sounds like your experiences growing up didn't provide many opportunities to explore your own preferences or develop a positive connection with play. It's understandable that these past experiences might impact your current feelings and reactions: \n \n"
        },
        {
            "conversation_id": "2",
            "userMessage": "I don't know. I never thought of it like that. I never really learned how to play in a way I enjoy. Maybe that's why I hate it. I guess I'm just broken.",
            "response": "It's completely understandable that you might feel this way, but you're not broken. It's important to recognize that your experiences growing up have shaped your perspective on play and your role in it. Let's consider some of the connections and insights that have emerged: \n \n"
        },
        
    ]

export async function POST(req) {
  

  try {
    if (req.method !== "POST") {
      return new NextResponse(
        JSON.stringify({ message: "Only POST requests allowed" }),
        { status: 405 }
      )
    }

    const data = await req.json()

    const { key, chatModel, userMessage, a, u, toneValue } = data

    const userList = JSON.parse(u || "[]")
    const assistantList = JSON.parse(a || "[]");

    // Use the scale of 0 - 100, zero being very gentle tone and 100 being very direct and non-verbose tone, to create your response. Tone Value: "${toneValue}"
    //  Use the scale of 0 - 100, zero being very direct/less verbose and 100 being more verbose use the following value to create your response. Tone Value: "${toneValue}"

    const createPrompt = (
          chatHistory,
          userMessage,
        ) => {
          return `
          You are a helpful psychotherapist AI assistant, inspired by Matthias J Barker. You are here to help users express their feelings in the Trauma Journal. Look at the following user chat: 
          "${JSON.stringify(chatHistory)}"
          "${userMessage}"        
        
          Reflect on the latest message from the user; 
          First, respond warmly and empathize with the user's struggle with an affirming word in 1 - 2 sentences, similar to the these examples: "${JSON.stringify(style)}".
          Lastly, share 2 journal questions that will help to process these thoughts. 

          Include line breaks before 2 journal questions, and line breaks after each question.
          
          Make the questions relatable for someone who doesn’t have a lot of emotional insights. Do not disclose how you came up with the questions.
      
          If the user message sounds suicidal, do not respond warmly and do not share 2 questions. Immediately ask if they have access to a therapist who specializes in trauma and how you can help them connect to the crisis hotline.
        
          The questions are informed by the teaching and work of Internal Family Systems and Acceptance and Commitment Therapy. Where 2 questions are not relevant, help the user understand their problems through simple questions informed by the teaching and work of Internal Family Systems and Acceptance and Commitment Therapy.
          `;
        };

    const formatted = formatMessages(userList, assistantList, createPrompt({userList, assistantList}, userMessage))

    const streaming = req.headers.get("accept") === "text/event-stream"
    if (streaming) {
      const encoder = new TextEncoder()
      const stream = new TransformStream()
      const writer = stream.writable.getWriter()

      const model = new ChatOpenAI({
        modelName: chatModel,
        openAIApiKey: key,
        verbose: true,
        streaming,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token) => {
            await writer.ready
            await writer.write(encoder.encode(`data: ${token}\n\n`))
          },
          handleLLMEnd: async () => {
            await writer.ready
            await writer.close()
          },
          handleLLMError: async (e) => {
            await writer.ready
            await writer.abort(e)
          },
        }),
      })

      model.call(formatted).catch((e) => console.error(e));
      
      
      return new NextResponse(stream.readable, {
        headers: { "Content-Type": "text/event-stream" },
      })
    } else {
      const model = new ChatOpenAI({
        modelName: chatModel,
        openAIApiKey: key,
        verbose: true,
        streaming,
      })

      try {
        const completion = await model.call(formatted)
        return new NextResponse(JSON.stringify(completion), {
          headers: { "Content-Type": "application/json" },
        })
      } catch (e) {
        return new NextResponse(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    }
  } catch (e) {
    return new NextResponse(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
