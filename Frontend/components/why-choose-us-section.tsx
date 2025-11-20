import { Card, CardContent } from "@/components/ui/card"
import { Wifi, Snowflake, Clock, Users, BookOpen, Trophy, MapPin, Coffee, Zap, Award, Shield, TrendingUp } from "lucide-react"

export function WhyChooseUsSection() {
  const features = [
    {
      icon: Snowflake,
      title: "AC Rooms",
      description: "Climate-controlled study environment for maximum comfort",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Wifi,
      title: "High-Speed Wi-Fi",
      description: "Reliable internet connectivity for research and online learning",
      color: "from-purple-500/20 to-blue-500/20",
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Extended operating hours to fit your schedule",
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: Users,
      title: "Doubt Sessions",
      description: "Regular doubt clearing sessions with expert mentors",
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: BookOpen,
      title: "Extensive Library",
      description: "Vast collection of books and study materials",
      color: "from-indigo-500/20 to-blue-500/20",
    },
    {
      icon: Trophy,
      title: "Proven Results",
      description: "95% success rate with personalized guidance",
      color: "from-yellow-500/20 to-orange-500/20",
    },
    {
      icon: MapPin,
      title: "Prime Location",
      description: "Easily accessible location with good connectivity",
      color: "from-pink-500/20 to-rose-500/20",
    },
    {
      icon: Coffee,
      title: "Refreshment Area",
      description: "Dedicated space for breaks and refreshments",
      color: "from-amber-500/20 to-orange-500/20",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-background via-primary/2 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose <span className="text-primary">SmartLibrary?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We provide world-class facilities, innovative technology, and personalized support to ensure your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className={`group relative overflow-hidden bg-gradient-to-br ${feature.color} border border-primary/10 hover:border-primary/30 rounded-xl p-6 transition-all duration-300 hover:shadow-lg`}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Icon */}
                  <div className="bg-card/60 backdrop-blur-sm border border-primary/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-card group-hover:shadow-md transition-all duration-300">
                    <Icon className="h-8 w-8 text-primary group-hover:text-primary/90 transition-colors" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-foreground mb-2 text-lg">{feature.title}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                  {/* Accent line */}
                  <div className="w-8 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Key Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card/50 border border-primary/20 rounded-xl p-8 text-center hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-foreground">95%</span>
            </div>
            <p className="text-muted-foreground">Success Rate</p>
          </div>
          <div className="bg-card/50 border border-primary/20 rounded-xl p-8 text-center hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Award className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-foreground">5000+</span>
            </div>
            <p className="text-muted-foreground">Books & Resources</p>
          </div>
          <div className="bg-card/50 border border-primary/20 rounded-xl p-8 text-center hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-foreground">2000+</span>
            </div>
            <p className="text-muted-foreground">Active Students</p>
          </div>
          <div className="bg-card/50 border border-primary/20 rounded-xl p-8 text-center hover:bg-card/80 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-foreground">24/7</span>
            </div>
            <p className="text-muted-foreground">Support Available</p>
          </div>
        </div>
      </div>
    </section>
  )
}
