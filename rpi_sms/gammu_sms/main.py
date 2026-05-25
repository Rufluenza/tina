from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route("/send", methods=["POST"])
def send_sms():
    number = request.json["number"]
    text = request.json["text"]

    cmd = [
        "gammu-smsd-inject",
        "TEXT",
        number,
        "-text",
        text,
    ]

    subprocess.run(cmd, check=True)

    return jsonify({"status": "sent"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)