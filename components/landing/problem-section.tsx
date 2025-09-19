"use client"

import { Card } from "@/components/ui/card"
import { AlertTriangle, Clock, Eye, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

export function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      title: "Traditional Hiring is Slow",
      description: "Lengthy processes waste time for both candidates and recruiters",
    },
    {
      icon: AlertTriangle,
      title: "Biased & Inefficient",
      description: "Subjective decisions lead to missed opportunities and poor matches",
    },
    {
      icon: Eye,
      title: "Lack of Transparency",
      description: "Job seekers get no feedback on what to improve",
    },
    {
      icon: HelpCircle,
      title: "Skills Gap",
      description: "Industry looks for job-ready candidates but training is inadequate",
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
            The Hiring <span className="text-primary">Black Box</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Current hiring processes create frustration and missed opportunities for everyone involved
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                <problem.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground text-sm">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-card border-2 border-destructive/20 p-8 text-center max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-4 text-destructive">The Result?</h3>
          <p className="text-lg text-muted-foreground mb-4">Raj fails miserably in interviews with no feedback.</p>
          <p className="text-lg text-muted-foreground">
            Recruiter Ram wastes time: "Where can I find exactly skilled candidates?"
          </p>
        </motion.div>
      </div>
    </section>
  )
}
