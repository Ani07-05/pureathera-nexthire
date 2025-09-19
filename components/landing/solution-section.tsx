"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Users, ClipboardCheck, Zap, ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export function SolutionSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Job Matching",
      description: "Advanced algorithms match candidates with perfect opportunities based on skills and potential",
    },
    {
      icon: Users,
      title: "Skill Development Platform",
      description: "Job seekers learn, upskill, and level up with personalized learning paths",
    },
    {
      icon: ClipboardCheck,
      title: "Customized Testing",
      description: "Recruiters get detailed hireable index and skilled candidate profiles",
    },
    {
      icon: Zap,
      title: "Transparency Filters",
      description: "Complete feedback loop protects job seekers and provides clear improvement paths",
    },
  ]

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Meet <span className="text-primary">Next-Hire</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            An incremental tool bridging the gap between job seekers and recruiters with AI-powered transparency
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <feature.icon className="h-16 w-16 text-primary mb-6" />
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-primary/5 border-2 border-primary/20 p-12 text-center"
        >
          <h3 className="text-3xl font-bold mb-6 text-primary">Why Next-Hire?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-accent flex-shrink-0" />
              <span className="text-xl">On-demand manpower, at any level, any place</span>
            </div>
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-accent flex-shrink-0" />
              <span className="text-xl">Industry ready candidates at scale</span>
            </div>
          </div>
          <Button size="lg" className="text-lg px-8 py-6 group">
            Experience Next-Hire
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
