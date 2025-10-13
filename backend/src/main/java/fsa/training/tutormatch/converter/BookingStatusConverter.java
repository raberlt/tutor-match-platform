package fsa.training.tutormatch.converter;

import fsa.training.tutormatch.enums.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BookingStatusConverter implements AttributeConverter<BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        if (attribute == null) return null;
        return attribute.name();
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String value = dbData.trim().toUpperCase();
        // Backward-compat mapping for legacy values existing in DB
        if ("PENDING".equals(value)) {
            return BookingStatus.PAYMENT_PENDING;
        }
        if ("CONFIRMED".equals(value)) {
            return BookingStatus.PAYMENT_COMPLETED;
        }
        try {
            return BookingStatus.valueOf(value);
        } catch (IllegalArgumentException ex) {
            // Unknown value: default to PAYMENT_PENDING to avoid runtime failures
            return BookingStatus.PAYMENT_PENDING;
        }
    }
}


