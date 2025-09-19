"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export function SuccessStory() {
  const steps = [
    {
      title: "Before Next-Hire",
      subtitle: "The Traditional Way",
      content: [
        "Raj goes for interview",
        "Raj fails miserably",
        "Raj gets no feedback",
        "Recruiter Ram: 'Waste of time, where can I find skilled candidates?'",
      ],
      color: "destructive",
    },
    {
      title: "With Next-Hire",
      subtitle: "The Smart Way",
      content: [
        "Raj learns and upskills on platform",
        "Raj levels up with personalized training",
        "RR gets pre-graded skilled candidate profiles",
        "Perfect match with detailed analysis",
      ],
      color: "primary",
    },
    {
      title: "Success Result",
      subtitle: "Win-Win Outcome",
      content: [
        "Raj gets selected with detailed feedback",
        "RR gets exactly skilled candidates",
        "Transparent hiring process",
        "Continuous improvement cycle",
      ],
      color: "accent",
    },
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            From Failure to <span className="text-primary">Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            See how Next-Hire transforms the hiring experience for both candidates and recruiters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card
                className={`p-8 h-full ${
                  step.color === "destructive"
                    ? "border-destructive/20 bg-destructive/5"
                    : step.color === "primary"
                      ? "border-primary/20 bg-primary/5"
                      : "border-accent/20 bg-accent/5"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      className={`${
                        step.color === "destructive"
                          ? "bg-destructive text-destructive-foreground"
                          : step.color === "primary"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {index === 0 ? "❌" : index === 1 ? "🚀" : "✅"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.subtitle}</p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {step.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      {step.color === "destructive" ? (
                        <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                      ) : (
                        <CheckCircle
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            step.color === "primary" ? "text-primary" : "text-accent"
                          }`}
                        />
                      )}
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
