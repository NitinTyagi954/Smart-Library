import { Card, CardContent } from "@/components/ui/card"
import { Target, Heart, Lightbulb, Users, CheckCircle } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">SmartLibrary</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Transforming education through innovative technology and personalized learning experiences tailored to every student's unique journey.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Mission Card */}
          <div className="group">
            <div className="bg-card border border-primary/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To empower students and professionals through accessible, high-quality education and comprehensive learning resources that foster growth, innovation, and success.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe every individual deserves the opportunity to learn, grow, and succeed. Our platform combines cutting-edge technology with human-centric pedagogy.
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group">
            <div className="bg-card border border-secondary/20 rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-secondary/20 rounded-lg">
                  <Lightbulb className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To become the leading digital learning platform that transforms lives through intelligent, adaptive education and creates a global community of lifelong learners.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We envision a world where quality education is accessible to everyone, regardless of location or background.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h3 className="text-3xl font-bold text-foreground mb-12 text-center">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-primary/20 rounded-lg mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Excellence</h4>
                  <p className="text-sm text-muted-foreground">Committed to the highest standards in education and service delivery</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-secondary/20 rounded-lg mb-4">
                    <Heart className="h-8 w-8 text-secondary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Student Focus</h4>
                  <p className="text-sm text-muted-foreground">Every decision is centered on student success and well-being</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-accent/20 rounded-lg mb-4">
                    <Lightbulb className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Innovation</h4>
                  <p className="text-sm text-muted-foreground">Continuously evolving with technology and pedagogical advances</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-green-500/20 rounded-lg mb-4">
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2 text-lg">Community</h4>
                  <p className="text-sm text-muted-foreground">Building inclusive and supportive learning environments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
