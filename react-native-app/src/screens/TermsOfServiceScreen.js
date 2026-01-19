/**
 * Terms of Service Screen
 * Required for App Store and Play Store compliance
 * Last updated: January 2026
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TermsOfServiceScreen = ({ navigation }) => {
  const lastUpdated = "January 19, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By downloading, installing, or using the LiftLink mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.

You must be at least 18 years old to use LiftLink. By using the App, you represent and warrant that you are at least 18 years of age.`
    },
    {
      title: "2. Description of Service",
      content: `LiftLink is a fitness platform that connects clients with personal trainers and provides:

• Trainer discovery and matching
• Workout program generation (AI-powered)
• Session booking and scheduling
• Payment processing for training services
• Progress tracking and analytics
• AI coaching chat and recommendations
• Gamification features (tree growth, achievements)

LiftLink is a platform that facilitates connections between trainers and clients. We are not responsible for the quality of training services provided by independent trainers.`
    },
    {
      title: "3. User Accounts",
      content: `To use LiftLink, you must create an account. You agree to:

• Provide accurate and complete information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account
• Not share your account with others
• Not create multiple accounts

We reserve the right to suspend or terminate accounts that violate these Terms.`
    },
    {
      title: "4. Trainer Terms",
      content: `If you register as a trainer, you additionally agree to:

• Provide accurate credentials and certifications
• Complete identity verification as required
• Maintain appropriate professional liability insurance
• Deliver services as described and scheduled
• Respond to client communications promptly
• Not solicit clients outside the platform to avoid fees
• Accept our payment processing and payout terms

Trainers are independent contractors, not employees of LiftLink.`
    },
    {
      title: "5. Payments",
      content: `Payments are processed securely through Stripe. By making a payment, you agree to:

• Pay the full amount for booked sessions
• Provide accurate payment information
• Our cancellation and refund policy
• Automatic charging for subscriptions if applicable

For trainers:
• Payouts are processed weekly
• We do not currently charge platform fees
• Stripe processing fees may apply
• You are responsible for your own taxes`
    },
    {
      title: "6. Cancellation & Refunds",
      content: `• Sessions cancelled 24+ hours in advance: Full refund
• Sessions cancelled 12-24 hours in advance: 50% refund
• Sessions cancelled less than 12 hours: No refund
• No-shows: No refund

Trainers who repeatedly cancel may have their accounts suspended. Clients who repeatedly no-show may be required to prepay for future sessions.`
    },
    {
      title: "7. AI Features Disclaimer",
      content: `LiftLink uses AI to provide workout recommendations and coaching advice. You acknowledge that:

• AI advice is general guidance, not medical advice
• Always consult healthcare providers for health concerns
• AI recommendations may not be suitable for everyone
• Results may vary based on individual circumstances
• We are not liable for injuries from AI recommendations

Do not use AI features as a substitute for professional medical advice, diagnosis, or treatment.`
    },
    {
      title: "8. Prohibited Conduct",
      content: `You agree not to:

• Violate any laws or regulations
• Impersonate others or misrepresent your identity
• Post false, misleading, or fraudulent content
• Harass, abuse, or harm other users
• Attempt to gain unauthorized access to our systems
• Use the App for any illegal purpose
• Scrape, copy, or extract data from the App
• Circumvent security features
• Use bots or automated systems
• Post spam or promotional content

Violations may result in account termination and legal action.`
    },
    {
      title: "9. Intellectual Property",
      content: `The App and its content are owned by LiftLink and protected by intellectual property laws. You may not:

• Copy, modify, or distribute our content
• Use our trademarks without permission
• Reverse engineer the App
• Remove copyright notices

You retain ownership of content you post (photos, workout logs), but grant us a license to use it for providing our services.`
    },
    {
      title: "10. Disclaimer of Warranties",
      content: `THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:

• MERCHANTABILITY
• FITNESS FOR A PARTICULAR PURPOSE
• NON-INFRINGEMENT
• ACCURACY OF INFORMATION
• AVAILABILITY OF SERVICES

We do not guarantee that the App will be uninterrupted, error-free, or secure.`
    },
    {
      title: "11. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• LiftLink is not liable for any injuries during workouts
• We are not responsible for trainer conduct or quality
• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to the amount you paid us in the past 12 months

Some jurisdictions do not allow certain limitations, so some may not apply to you.`
    },
    {
      title: "12. Indemnification",
      content: `You agree to indemnify and hold LiftLink harmless from any claims, damages, or expenses arising from:

• Your use of the App
• Your violation of these Terms
• Your violation of any third-party rights
• Content you post or share
• Your interactions with other users`
    },
    {
      title: "13. Dispute Resolution",
      content: `Any disputes arising from these Terms will be resolved through:

1. Good faith negotiation between parties
2. Binding arbitration (if negotiation fails)
3. Small claims court (for qualifying disputes)

You waive the right to participate in class action lawsuits. Disputes must be brought within one year of the issue arising.`
    },
    {
      title: "14. Changes to Terms",
      content: `We may modify these Terms at any time. We will notify you of material changes through the App or email. Continued use after changes constitutes acceptance of the new Terms.

If you disagree with changes, you may delete your account.`
    },
    {
      title: "15. Contact Information",
      content: `For questions about these Terms:

Email: legal@liftlink.app
Address: LiftLink Inc.
Support: help@liftlink.app`
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#f9fafb" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        
        <Text style={styles.intro}>
          Welcome to LiftLink! These Terms of Service govern your use of our 
          mobile application and services. Please read them carefully before 
          using the App.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using LiftLink, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Service.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:legal@liftlink.app')}
          >
            <Icon name="gavel" size={20} color="#f9fafb" />
            <Text style={styles.contactButtonText}>Contact Legal Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 24,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  intro: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
});

export default TermsOfServiceScreen;
