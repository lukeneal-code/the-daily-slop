terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# -------------------------------------------------------
# Enable required APIs
# -------------------------------------------------------
resource "google_project_service" "secretmanager" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "compute" {
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

# -------------------------------------------------------
# Service account for the VM
# -------------------------------------------------------
resource "google_service_account" "daily_slop" {
  account_id   = "daily-slop-vm"
  display_name = "Daily Slop VM service account"
}

# -------------------------------------------------------
# Secret Manager: Anthropic API key
# -------------------------------------------------------
resource "google_secret_manager_secret" "anthropic_api_key" {
  secret_id = "daily-slop-anthropic-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "anthropic_api_key" {
  secret      = google_secret_manager_secret.anthropic_api_key.id
  secret_data = var.anthropic_api_key
}

resource "google_secret_manager_secret_iam_member" "anthropic_accessor" {
  secret_id = google_secret_manager_secret.anthropic_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.daily_slop.email}"
}

# -------------------------------------------------------
# Secret Manager: OpenAI API key
# -------------------------------------------------------
resource "google_secret_manager_secret" "openai_api_key" {
  secret_id = "daily-slop-openai-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

resource "google_secret_manager_secret_version" "openai_api_key" {
  secret      = google_secret_manager_secret.openai_api_key.id
  secret_data = var.openai_api_key
}

resource "google_secret_manager_secret_iam_member" "openai_accessor" {
  secret_id = google_secret_manager_secret.openai_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.daily_slop.email}"
}

# -------------------------------------------------------
# Static external IP (free while attached to a running VM)
# -------------------------------------------------------
resource "google_compute_address" "daily_slop" {
  name   = "daily-slop-ip"
  region = var.region
}

# -------------------------------------------------------
# Firewall: allow HTTP (port 80)
# -------------------------------------------------------
resource "google_compute_firewall" "allow_http" {
  name    = "daily-slop-allow-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["daily-slop"]
}

# -------------------------------------------------------
# Firewall: allow SSH (port 22)
# -------------------------------------------------------
resource "google_compute_firewall" "allow_ssh" {
  name    = "daily-slop-allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["daily-slop"]
}

# -------------------------------------------------------
# VM instance: e2-micro (free tier eligible)
# -------------------------------------------------------
resource "google_compute_instance" "daily_slop" {
  name         = "daily-slop"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["daily-slop"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"

    access_config {
      nat_ip = google_compute_address.daily_slop.address
    }
  }

  metadata = {
    gcp-project-id = var.project_id
  }

  metadata_startup_script = file("${path.module}/startup.sh")

  service_account {
    email  = google_service_account.daily_slop.email
    scopes = ["cloud-platform"]
  }

  depends_on = [
    google_secret_manager_secret_version.anthropic_api_key,
    google_secret_manager_secret_version.openai_api_key,
  ]
}
