
import { Booking, Unit, AiConfigData } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

export const getAiResponse = async (
    prompt: string,
    bookings: Booking[],
    units: Unit[],
    config: AiConfigData
): Promise<string> => {
    // Mock AI response without using actual API
    console.log('AI Agent simulation - prompt:', prompt);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock response based on the prompt and context
    const mockResponses = [
        `Hello! I'm here to help you with your ${units.length > 0 ? units[0].type.toLowerCase() : 'accommodation'} booking. ${config.welcomeMessage}`,
        `Based on your inquiry, I can see we have ${units.filter(u => u.status === 'Active').length} available units. How can I assist you today?`,
        `Thank you for your interest! Our ${config.bookingMethod === 'AI Agent Full Booking' ? 'AI system can handle your complete booking' : 'team can redirect you to our website for booking'}. What dates are you looking for?`,
        `I'd be happy to help you find the perfect accommodation. We currently have ${bookings.filter(b => b.status === 'Confirmed').length} confirmed bookings this month. What are your preferences?`,
        `Welcome! Our properties offer great amenities and we're here to make your stay comfortable. How many guests will be staying?`
    ];
    
    // Return a random mock response or a contextual one
    if (prompt.toLowerCase().includes('booking') || prompt.toLowerCase().includes('reserve')) {
        return `I can help you with booking information! ${config.bookingMethod === 'AI Agent Full Booking' ? 'I can process your reservation directly.' : 'I\'ll guide you to our website for booking.'} What dates are you interested in?`;
    }
    
    if (prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('cost')) {
        return `I'd be happy to help with pricing information. ${config.discountEnabled ? `We currently have a ${config.discountAmount}% discount available with code ${config.couponCode}!` : 'Let me check our current rates for your dates.'} When would you like to stay?`;
    }
    
    if (prompt.toLowerCase().includes('available') || prompt.toLowerCase().includes('vacancy')) {
        return `Let me check availability for you! We have ${units.filter(u => u.status === 'Active').length} active units. What dates are you considering?`;
    }
    
    // Default response
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return randomResponse;
};
