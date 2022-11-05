import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string
)

export default function Home() {
  const roomId = 'test-channel'
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const channel = supabase.channel(roomId)
    channel.subscribe(async (status, err) => console.log('Subscribing to channel', status, err?.message))
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log('Received message', payload)
        setMessages((prev) => [...prev, payload])
      }
    )
    return () => {
      supabase.removeAllChannels()
    }
  }, [])

  async function insertMessage() {
    // Update the supabase table. I want to receive an event once this message has been posted.
    const res = await supabase.from('messages').insert({
      room_id: roomId,
      message: `Welcome to Realtime! ${new Date().toISOString()}`,
    })
  }

  return (
    <div>
      <button onClick={insertMessage}>Post a message</button>
      <p>Messages in the realtime db:</p>
      {messages.map((message) => (
        <div>{message}</div>
      ))}
    </div>
  )
}
