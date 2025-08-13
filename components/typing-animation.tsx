"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface TypingAnimationProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function TypingAnimation({ 
  text, 
  speed = 50, 
  onComplete, 
  className = "" 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (text && !isTyping) {
      setIsTyping(true)
      setDisplayedText("")
      setCurrentIndex(0)
    }
  }, [text, isTyping])

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (isTyping && onComplete) {
        onComplete()
      }
      setIsTyping(false)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex])
      setCurrentIndex(prev => prev + 1)
    }, speed)

    return () => clearTimeout(timer)
  }, [currentIndex, text, speed, isTyping, onComplete])

  return (
    <div className={`relative ${className}`}>
      <span>{displayedText}</span>
      {isTyping && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-blue-500 ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  )
}
