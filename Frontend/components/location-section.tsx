"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

const CAMPUS = { lat: 30.298479439839507, lng: 77.93070692199584 }

// Haversine distance in kilometers
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function LocationSection() {
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const handleGetDistance = () => {
    setGeoError(null)
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const km = haversineKm(latitude, longitude, CAMPUS.lat, CAMPUS.lng)
        setDistanceKm(km)
        setLocating(false)
      },
      (err) => {
        setGeoError(err.message || "Unable to retrieve your location.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <section id="contact" className="py-20 bg-background scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Visit Our Campus</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Located in the heart of the city with excellent connectivity and modern facilities.
          </p>
        </div>

        {/* Tighten gaps: small on mobile; on lg, only column gap */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
          {/* Left column: Map + Distance (stacked) */}
          <div className="lg:col-start-1 lg:row-start-1">
            <div className="overflow-hidden h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4987.057915325872!2d77.93070692199584!3d30.298479439839507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092babd8613765%3A0x6672d1e5fcb91d8e!2sULTIMATE%20SUCCESS%20LIBRARY!5e0!3m2!1sen!2sin!4v1758080376371!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ultimate Success Institute Location"
              />
            </div>

            {/* Distance directly below map */}
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    Your Distance to Campus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={handleGetDistance}
                      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                      disabled={locating}
                    >
                      {locating ? "Locating..." : "Calculate distance"}
                    </button>
                    {distanceKm !== null && (
                      <p className="text-muted-foreground">{distanceKm.toFixed(1)} km away</p>
                    )}
                  </div>
                  {geoError && <p className="mt-2 text-sm text-destructive">{geoError}</p>}
                  {distanceKm !== null && (
                    <a
                      className="mt-3 inline-block text-sm text-primary hover:underline"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${CAMPUS.lat},${CAMPUS.lng}`
                      )}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open directions in Google Maps
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column: Contact Info */}
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            {/* Address Card (currently commented)
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  123 Education Street
                  <br />
                  Knowledge District
                  <br />
                  New Delhi - 110001
                  <br />
                  India
                </p>
              </CardContent>
            </Card>
            */}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  +91 98765 43210
                  <br />
                  +91 11 2345 6789
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  info@ultimatesuccessinstitute.com
                  <br />
                  admissions@ultimatesuccessinstitute.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p>Monday - Friday: 6:00 AM - 10:00 PM</p>
                  <p>Saturday: 7:00 AM - 9:00 PM</p>
                  <p>Sunday: 8:00 AM - 8:00 PM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
