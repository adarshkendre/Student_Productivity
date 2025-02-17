import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Bot } from "lucide-react";

interface Message {
  type: "user" | "bot";
  content: string;
}

export default function ConceptValidation() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([{
    type: "bot",
    content: "Hi! What did you learn today? Tell me about the concepts you've covered."
  }]);
  const [input, setInput] = useState("");

  const validateMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/validate-concept", { content });
      return res.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, { type: "bot", content: response.message }]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: "user", content: input }]);
    validateMutation.mutate(input);
    setInput("");
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Concept Validation</h2>
      <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "bot" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`rounded-lg p-4 max-w-[80%] ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {validateMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-lg p-4 bg-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me what you've learned..."
          className="flex-1"
          rows={1}
        />
        <Button type="submit" size="icon" disabled={validateMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
