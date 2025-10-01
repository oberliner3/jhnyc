import { Metadata } from 'next';
import { MapPin, Clock, Users, Heart, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Careers | Join Our Team',
  description: 'Explore career opportunities and join our growing team. We\'re looking for talented individuals to help us build the future.',
};

const jobListings = [
  {
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We\'re looking for a talented frontend developer to help build amazing user experiences.',
    requirements: [
      'Proficiency in React, TypeScript, and modern web technologies',
      '3+ years of frontend development experience',
      'Strong understanding of responsive design and accessibility',
    ],
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    description: 'Join our customer success team and help our clients achieve their goals.',
    requirements: [
      'Experience in customer success or account management',
      'Excellent communication and problem-solving skills',
      'Ability to build strong relationships with clients',
    ],
  },
  {
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Remote',
    type: 'Part-time',
    description: 'Help drive our marketing initiatives and grow our brand presence.',
    requirements: [
      'Experience with digital marketing and social media',
      'Creative thinking and strong analytical skills',
      'Knowledge of marketing automation tools',
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance, dental, vision, and wellness programs.',
  },
  {
    icon: Clock,
    title: 'Work-Life Balance',
    description: 'Flexible schedules, remote work options, and generous PTO.',
  },
  {
    icon: Target,
    title: 'Growth & Development',
    description: 'Professional development budget, conferences, and learning opportunities.',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work with talented, passionate people in a collaborative environment.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Work on cutting-edge projects and have your ideas heard.',
  },
];

const values = [
  {
    title: 'Customer First',
    description: 'We put our customers at the center of everything we do.',
  },
  {
    title: 'Innovation',
    description: 'We embrace change and continuously seek better ways to solve problems.',
  },
  {
    title: 'Collaboration',
    description: 'We believe diverse perspectives make us stronger.',
  },
  {
    title: 'Integrity',
    description: 'We do the right thing, even when no one is watching.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            We&apos;re building something special and we&apos;re looking for talented, passionate people
            to join us on this journey. Discover opportunities to grow your career while making 
            a meaningful impact.
          </p>
        </div>

        {/* Company Values */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              These principles guide how we work together and serve our customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Work With Us</h2>
            <p className="text-muted-foreground">
              We believe in taking care of our team so they can do their best work.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                    {benefit.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
            <p className="text-muted-foreground">
              Current opportunities to join our team.
            </p>
          </div>
          <div className="space-y-6 max-w-4xl mx-auto">
            {jobListings.map((job, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
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
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Don&apos;t See a Perfect Fit?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We&apos;re always looking for talented people to join our team. Send us your resume 
            and let us know how you&apos;d like to contribute to our mission.
          </p>
          <div className="space-x-4">
            <a
              href="mailto:careers@example.com"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Send Resume
            </a>
            <a
              href="/contact"
              className="inline-block border border-input bg-background px-6 py-2 rounded-md hover:bg-accent transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}