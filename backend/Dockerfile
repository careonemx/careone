# ===== Etapa 1: build con Maven =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cachear dependencias: primero el pom, luego el codigo.
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ===== Etapa 2: runtime con JRE alpine, usuario no-root =====
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Usuario sin privilegios
RUN addgroup -S careone && adduser -S careone -G careone

COPY --from=build /app/target/*.jar app.jar
RUN chown -R careone:careone /app
USER careone

EXPOSE 8080

# Healthcheck contra el actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
