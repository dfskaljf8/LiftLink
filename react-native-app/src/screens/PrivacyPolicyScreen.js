/**
 * Privacy Policy Screen
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

const PrivacyPolicyScreen = ({ navigation }) => {
  const lastUpdated = "January 19, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us, such as:
      
• Account information (name, email, profile photo)
• Fitness data (workouts, progress, goals)
• Health data (if you connect Google Fit or Apple Health)
• Payment information (processed securely via Stripe)
• Communications with trainers and AI coach
• Location data (only when finding nearby trainers)
• Device information for security purposes`
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Match you with suitable fitness trainers
• Generate AI-powered workout recommendations
• Process payments for training sessions
• Send you notifications about workouts and progress
• Ensure security and prevent fraud
• Comply with legal obligations`
    },
    {
      title: "3. AI and Data Processing",
      content: `LiftLink uses AI (powered by OpenAI GPT-5) to:

• Generate personalized workout programs
• Provide fitness coaching and advice
• Analyze your progress and patterns
• Create motivational messages

Your conversations with the AI coach are processed by OpenAI. We do not share personally identifiable information with AI providers. All AI interactions are anonymized and encrypted.`
    },
    {
      title: "4. Data Sharing",
      content: `We may share your information with:

• Trainers you book sessions with (limited profile info)
• Payment processors (Stripe) for transactions
• Cloud service providers for data storage
• Analytics services to improve our app
• Legal authorities when required by law

We never sell your personal data to third parties.`
    },
    {
      title: "5. Data Security",
      content: `We implement industry-standard security measures:

• End-to-end encryption for sensitive data
• Secure HTTPS connections for all communications
• Certificate pinning to prevent man-in-the-middle attacks
• Regular security audits and penetration testing
• Jailbreak/root detection for compromised devices
• Rate limiting to prevent abuse
• Token-based authentication with automatic expiry`
    },
    {
      title: "6. Your Rights",
      content: `You have the right to:

• Access your personal data
• Correct inaccurate data
• Delete your account and associated data
• Export your data in a portable format
• Opt out of marketing communications
• Withdraw consent for data processing

To exercise these rights, contact us at privacy@liftlink.app`
    },
    {
      title: "7. Data Retention",
      content: `We retain your data for as long as your account is active or as needed to provide services. After account deletion:

• Profile data is deleted within 30 days
• Workout history is anonymized and retained for analytics
• Payment records are retained for 7 years (legal requirement)
• AI conversation history is deleted immediately`
    },
    {
      title: "8. Children's Privacy",
      content: `LiftLink is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided us with personal data, please contact us immediately.`
    },
    {
      title: "9. International Data Transfers",
      content: `Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place, including:

• Standard contractual clauses approved by regulatory authorities
• Data processing agreements with all service providers
• Compliance with GDPR for EU users`
    },
    {
      title: "10. Changes to This Policy",
      content: `We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the app after changes constitutes acceptance of the updated policy.`
    },
    {
      title: "11. Contact Us",
      content: `If you have any questions about this Privacy Policy, please contact us:

Email: privacy@liftlink.app
Address: LiftLink Inc.
Support: In-app chat or help@liftlink.app`
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#f9fafb" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>LiftLink Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        
        <Text style={styles.intro}>
          LiftLink ("we", "our", or "us") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard 
          your information when you use our mobile application.
        </Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:privacy@liftlink.app')}
          >
            <Icon name="email" size={20} color="#f9fafb" />
            <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
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

export default PrivacyPolicyScreen;
