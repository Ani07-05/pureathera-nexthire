"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Users, Building, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to Transform Your <span className="text-primary">Career</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Join thousands of professionals who have found their perfect match through Next-Hire
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full text-center hover:shadow-xl transition-all duration-300">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">For Job Seekers</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Upskill, get assessed, and land your dream job with transparent feedback and AI-powered matching.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="w-full group">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 h-full text-center hover:shadow-xl transition-all duration-300">
              <Building className="h-16 w-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">For Recruiters</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Access pre-screened, skilled candidates with detailed assessments and hireable indexes.
              </p>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="w-full group bg-transparent">
                  Find Talent
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Zap className="h-5 w-5 text-accent" />
            <span className="text-foreground/80">Powered by Pure Athera • Incorporated 05-04-2019</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
