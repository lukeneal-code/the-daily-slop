output "external_ip" {
  description = "Static external IP address of the VM"
  value       = google_compute_address.daily_slop.address
}

output "app_url" {
  description = "URL to access The Daily Slop"
  value       = "http://${google_compute_address.daily_slop.address}"
}

output "ssh_command" {
  description = "SSH into the VM"
  value       = "gcloud compute ssh daily-slop --zone=${var.zone} --project=${var.project_id}"
}
