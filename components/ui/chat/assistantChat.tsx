import * as React from "react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AssistantChatCard({ text = "Hi, how can I help you?" }) {
  const lines = text.split('\n');


  return (
    <div className="mb-[25px] ml-[25px] mt-[20px]">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle> 💰 Bag Assistant</CardTitle>
          <CardDescription>
            {/* Render the lines, inserting <br /> for line breaks */}
            {lines.map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
