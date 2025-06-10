import React from 'react'

interface JsonLdProps {
  data: Record<string, any>
  id: string
}

export const JsonLd: React.FC<JsonLdProps> = ({ data, id }) => {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  )
}

export default JsonLd 
 