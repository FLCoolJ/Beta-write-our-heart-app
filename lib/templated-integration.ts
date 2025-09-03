interface TemplatedConfig {
  apiKey: string
  templateId: string
  baseUrl?: string
}

interface TemplatedCardRequest {
  frontImage: string
  insideText: string
  occasion: string
  recipient: string
}

interface TemplatedResponse {
  id: string
  status: "processing" | "completed" | "failed"
  downloadUrl?: string
  previewUrl?: string
  error?: string
}

class TemplatedIntegration {
  private config: TemplatedConfig | null = null

  private getConfig(): TemplatedConfig {
    if (!this.config) {
      const apiKey = process.env.TEMPLATED_API_KEY
      const templateId = process.env.TEMPLATED_TEMPLATE_ID

      if (!apiKey || !templateId) {
        throw new Error(
          "Templated.io API key and template ID are required. Please set TEMPLATED_API_KEY and TEMPLATED_TEMPLATE_ID environment variables.",
        )
      }

      this.config = {
        apiKey,
        templateId,
        baseUrl: "https://api.templated.io/v1",
      }
    }

    return this.config
  }

  async generateCard(
    request: TemplatedCardRequest,
    userId?: string,
    recipientName?: string,
    occasion?: string,
  ): Promise<TemplatedResponse> {
    try {
      const config = this.getConfig()

      // Prepare the template data
      const templateData = {
        template_id: config.templateId,
        data: {
          front_image: request.frontImage,
          inside_poetry: request.insideText,
          occasion: request.occasion,
          recipient: request.recipient,
        },
        format: "pdf",
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/templated/webhook`,
        metadata: {
          userId,
          recipientName,
          occasion,
          timestamp: new Date().toISOString(),
        },
      }

      const response = await fetch(`${config.baseUrl}/render`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Templated.io API error: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      const result = await response.json()

      return {
        id: result.id || `temp_${Date.now()}`,
        status: result.status || "processing",
        downloadUrl: result.download_url,
        previewUrl: result.preview_url,
        error: result.error,
      }
    } catch (error) {
      console.error("Templated.io generation error:", error)
      return {
        id: `error_${Date.now()}`,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async getCardStatus(cardId: string): Promise<TemplatedResponse> {
    try {
      const config = this.getConfig()

      const response = await fetch(`${config.baseUrl}/render/${cardId}`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get card status: ${response.status}`)
      }

      const result = await response.json()

      return {
        id: result.id,
        status: result.status,
        downloadUrl: result.download_url,
        previewUrl: result.preview_url,
        error: result.error,
      }
    } catch (error) {
      console.error("Error getting card status:", error)
      return {
        id: cardId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Test method to verify integration
  async testConnection(): Promise<boolean> {
    try {
      const config = this.getConfig()

      const response = await fetch(`${config.baseUrl}/templates/${config.templateId}`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Templated.io connection test failed:", error)
      return false
    }
  }
}

// Export a singleton instance
export const templatedIntegration = new TemplatedIntegration()
