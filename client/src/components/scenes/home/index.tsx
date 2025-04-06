import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Bot, PencilRuler, Rocket, Earth, BrainCircuit } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 -z-10" />
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Prepare for the future with <span className="text-primary">insights</span> into it
              </h1>
              <p className="text-lg text-muted-foreground">
                ForeCache generates fresh, challenging questions across various programming languages, adapting to your
                skill level for a personalized learning experience.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/rooms">
                  <Button size="lg" className="gap-2" onClick={() => console.log("Start Quiz button clicked")}>
                    <Rocket className="h-5 w-5" />
                        ForeCache Future
                  </Button>
                </Link>
                <Link to="/agents">
                  <Button size="lg" variant="outline">
                    Explore lifestyles
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative w-full h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-lg shadow-lg p-4 rotate-6 animate-float">
                  <div className="h-4 w-32 bg-primary/20 rounded mb-2"></div>
                  <div className="h-3 w-28 bg-primary/20 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-accent/30 rounded"></div>
                    <div className="h-3 w-full bg-accent/30 rounded"></div>
                    <div className="h-3 w-full bg-accent/30 rounded"></div>
                  </div>
                </div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-lg shadow-lg p-4 -rotate-3 animate-bounce-slow">
                  <div className="h-4 w-32 bg-primary/20 rounded mb-2"></div>
                  <div className="h-3 w-28 bg-primary/20 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 w-full bg-accent/30 rounded"></div>
                    <div className="h-8 w-full bg-accent/30 rounded"></div>
                    <div className="h-8 w-full bg-accent/30 rounded"></div>
                    <div className="h-8 w-full bg-accent/30 rounded"></div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Bot className="h-16 w-16 text-black dark:text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Limitless Possibilities</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                ForeCache combines cutting-edge AI with engaging gameplay to create a unique coding quiz experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow quiz-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Powered Assistants</h3>
                <p className="text-muted-foreground">
                  Our AI creates fresh, original coding questions that adapt to your skill level and learning pace
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow quiz-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BrainCircuit className="h-6 w-6 text-primary dark:text-pink-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Self-Evolving Bots</h3>
                <p className="text-muted-foreground">
                  Track your coding progress and receive personalized recommendations based on your performance
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow quiz-card">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Earth className="h-6 w-6 text-primary dark:text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Interactive World</h3>
                <p className="text-muted-foreground">
                  Compete with fellow coders and climb the global and language-specific leaderboards
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to ____?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              ___ your first ___ now and discover the power of AI-generated learning
            </p>
            <Link to="/gearbox">
              <Button size="lg" variant="secondary" className="gap-2">
                <PencilRuler className="h-5 w-5" />
                ForeCache my Future
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

