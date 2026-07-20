from fastapi import FastAPI

app = FastAPI(
    title="SmartCattle Net API",
    version="1.0.0",
)

@app.get("/")
def root():
    return {
        "message": "SmartCattle Net Backend Running"
    }