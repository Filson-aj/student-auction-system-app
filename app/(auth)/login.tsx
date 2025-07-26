import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { images } from '@/constants';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { useLoginMutation } from '@/lib/store/api/authApi';
import { setCredentials } from '@/lib/store/slice/authSlice';
import { setSpinner } from '@/lib/store/slice/spinnerSlice';
import { useDispatch } from 'react-redux';

export default function LoginScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();

    const [login] = useLoginMutation();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginFormData) => {
        let alertType: 'Success' | 'Error' = 'Error';
        let alertText = 'Login failed. Please try again.';

        dispatch(setSpinner({ visibility: true }));

        try {
            const result = await login(data).unwrap();
            const { status, user, accessToken } = result;

            if (status === 'SUCCESS') {
                dispatch(setCredentials({ token: accessToken, user }));
                alertType = 'Success';
                alertText = `Welcome back, ${user.name ?? 'Admin'}!`;

                const roles = Array.isArray(user.roles)
                    ? user.roles.map(r => r.toLowerCase())
                    : [];
                setTimeout(() => {
                    dispatch(setSpinner({ visibility: false }));
                    Alert.alert(
                        'Account Login',
                        alertText,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    if (roles.includes('admin')) {
                                        router.replace('/(admin)/dashboard');
                                    } else {
                                        router.replace('/(tabs)');
                                    }
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                }, 500);

                return;
            }

        } catch (err: any) {
            if (err.status === 'FETCH_ERROR') {
                alertText = 'Network error—please check your connection.';
            } else {
                alertText = err.data?.message ?? alertText;
            }
        }

        // In case of error
        setTimeout(() => {
            dispatch(setSpinner({ visibility: false }));
            Alert.alert('Account Login', alertText);
        }, 500);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.gradient}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        {/* Logo & Branding */}
                        <View style={styles.logoContainer}>
                            <Image source={images.logo} style={styles.logoImage} />
                            <Text style={styles.logoText}>Students Auction</Text>
                            <Text style={styles.tagline}>Federal University Lafia</Text>
                            <Text style={styles.tagline}>
                                Buy and sell within your college community
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.subtitleText}>Sign in to your account</Text>

                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <View style={styles.textInputContainer}>
                                            <Mail
                                                size={20}
                                                strokeWidth={2}
                                                stroke="#6B7280"
                                                style={styles.inputIcon}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email"
                                                placeholderTextColor="#9CA3AF"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                        {errors.email && (
                                            <Text style={styles.fieldError}>{errors.email.message}</Text>
                                        )}
                                    </View>
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, value } }) => (
                                    <View style={styles.inputContainer}>
                                        <View style={styles.textInputContainer}>
                                            <Lock
                                                size={20}
                                                strokeWidth={2}
                                                stroke="#6B7280"
                                                style={styles.inputIcon}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Password"
                                                placeholderTextColor="#9CA3AF"
                                                secureTextEntry={!showPassword}
                                                value={value}
                                                onChangeText={onChange}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => setShowPassword(s => !s)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={20} strokeWidth={2} stroke="#6B7280" />
                                                ) : (
                                                    <Eye size={20} strokeWidth={2} stroke="#6B7280" />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        {errors.password && (
                                            <Text style={styles.fieldError}>
                                                {errors.password.message}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />

                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.loginButton,
                                    isSubmitting && styles.loginButtonDisabled,
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.signupContainer}>
                                <Text style={styles.signupText}>Don't have an account? </Text>
                                <Link href="/signup" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.signupLink}>Sign up</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    scrollContainer: { flexGrow: 1 },
    container: { flex: 1, padding: 24 },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    logoImage: { width: 80, height: 80, borderRadius: 40 },
    logoText: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        marginTop: 16,
    },
    tagline: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    welcomeText: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitleText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: { marginBottom: 16 },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    inputIcon: { marginRight: 8 },
    input: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#1F2937',
    },
    eyeIcon: { padding: 4 },
    fieldError: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#B91C1C',
        marginTop: 4,
        marginLeft: 12,
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#6366F1',
    },
    loginButton: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    loginButtonDisabled: { opacity: 0.7 },
    loginButtonText: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    signupLink: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#6366F1',
    },
});
