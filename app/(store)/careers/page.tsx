import { Clock, Heart, MapPin, Target, Users, Zap } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Careers | Join Our Team",
  description:
    "Explore career opportunities and join our growing team. We're looking for talented individuals to help us build the future.",
};

export const dynamic = "force-dynamic";

const jobListings = [
  {
    title: "Frontend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "We're looking for a talented frontend developer to help build amazing user experiences.",
    requirements: [
      "Proficiency in React, TypeScript, and modern web technologies",
      "3+ years of frontend development experience",
      "Strong understanding of responsive design and accessibility",
    ],
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Los Angeles, CA",
    type: "Full-time",
    description:
      "Join our customer success team and help our clients achieve their goals.",
    requirements: [
      "Experience in customer success or account management",
      "Excellent communication and problem-solving skills",
      "Ability to build strong relationships with clients",
    ],
  },
  {
    title: "Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    description:
      "Help drive our marketing initiatives and grow our brand presence.",
    requirements: [
      "Experience with digital marketing and social media",
      "Creative thinking and strong analytical skills",
      "Knowledge of marketing automation tools",
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health insurance, dental, vision, and wellness programs.",
  },
  {
    icon: Clock,
    title: "Work-Life Balance",
    description: "Flexible schedules, remote work options, and generous PTO.",
  },
  {
    icon: Target,
    title: "Growth & Development",
    description:
      "Professional development budget, conferences, and learning opportunities.",
  },
  {
    icon: Users,
    title: "Great Team",
    description:
      "Work with talented, passionate people in a collaborative environment.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Work on cutting-edge projects and have your ideas heard.",
  },
];

const values = [
  {
    title: "Customer First",
    description: "We put our customers at the center of everything we do.",
  },
  {
    title: "Innovation",
    description:
      "We embrace change and continuously seek better ways to solve problems.",
  },
  {
    title: "Collaboration",
    description: "We believe diverse perspectives make us stronger.",
  },
  {
    title: "Integrity",
    description: "We do the right thing, even when no one is watching.",
  },
];

export default function CareersPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 container">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-4xl">Join Our Team</h1>
          <p className="mx-auto max-w-3xl text-muted-foreground text-lg">
            We&apos;re building something special and we&apos;re looking for
            talented, passionate people to join us on this journey. Discover
            opportunities to grow your career while making a meaningful impact.
          </p>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-bold text-3xl">Our Values</h2>
            <p className="text-muted-foreground">
              These principles guide how we work together and serve our
              customers.
            </p>
          </div>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card
                key={`value-${value.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-bold text-3xl">Why Work With Us</h2>
            <p className="text-muted-foreground">
              We believe in taking care of our team so they can do their best
              work.
            </p>
          </div>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card
                key={`benefit-${benefit.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-bold text-3xl">Open Positions</h2>
            <p className="text-muted-foreground">
              Current opportunities to join our team.
            </p>
          </div>
          <div className="space-y-6 mx-auto max-w-4xl">
            {jobListings.map((job) => (
              <Card key={`job-${job.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-2 text-xl">
                        {job.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{job.description}</p>
                  <div>
                    <h4 className="mb-2 font-medium">Requirements:</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      {job.requirements.map((req) => (
                        <li
                          key={`req-${req
                            .substring(0, 20)
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="flex items-start gap-2"
                        >
                          <span className="flex-shrink-0 bg-muted-foreground mt-2 rounded-full w-1 h-1"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-muted/50 p-8 rounded-lg text-center">
          <h2 className="mb-4 font-bold text-2xl">
            Don&apos;t See a Perfect Fit?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            We&apos;re always looking for talented people to join our team. Send
            us your resume and let us know how you&apos;d like to contribute to
            our mission.
          </p>
          <div className="space-x-4">
            <a
              href="mailto:careers@example.com"
              className="inline-block bg-primary hover:bg-primary/90 px-6 py-2 rounded-md text-primary-foreground transition-colors"
            >
              Send Resume
            </a>
            <a
              href="/contact"
              className="inline-block bg-background hover:bg-accent px-6 py-2 border border-input rounded-md transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
