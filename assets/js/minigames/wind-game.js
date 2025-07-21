const windGameCanvas = document.getElementById('windGame');
            const windGameCtx = windGameCanvas.getContext('2d');
            const windStartBtn = document.getElementById('windStartBtn');
            const windResetBtn = document.getElementById('windResetBtn');
            const windGameScore = document.getElementById('windGameScore');
            
            let windTurbines = [];
            let windGameRunning = false;
            let windScore = 0;
            let windDirection = 0;
            
            function drawWindGame() {
                // Clear canvas
                windGameCtx.clearRect(0, 0, windGameCanvas.width, windGameCanvas.height);
                
                // Draw background (simple landscape)
                windGameCtx.fillStyle = '#8B4513';
                windGameCtx.fillRect(0, 300, windGameCanvas.width, 100);
                
                windGameCtx.fillStyle = '#228B22';
                windGameCtx.beginPath();
                windGameCtx.moveTo(0, 300);
                for (let x = 0; x <= windGameCanvas.width; x += 50) {
                    const height = 200 + Math.sin(x / 50) * 50;
                    windGameCtx.lineTo(x, height);
                }
                windGameCtx.lineTo(windGameCanvas.width, 300);
                windGameCtx.closePath();
                windGameCtx.fill();
                
                // Draw wind direction indicator
                windGameCtx.save();
                windGameCtx.translate(50, 50);
                windGameCtx.rotate(windDirection);
                
                windGameCtx.strokeStyle = 'black';
                windGameCtx.lineWidth = 2;
                windGameCtx.beginPath();
                windGameCtx.moveTo(0, 0);
                windGameCtx.lineTo(30, 0);
                windGameCtx.stroke();
                
                windGameCtx.beginPath();
                windGameCtx.moveTo(30, 0);
                windGameCtx.lineTo(20, -10);
                windGameCtx.lineTo(20, 10);
                windGameCtx.closePath();
                windGameCtx.fillStyle = 'black';
                windGameCtx.fill();
                
                windGameCtx.restore();
                
                // Draw turbines
                windTurbines.forEach(turbine => {
                    // Tower
                    windGameCtx.fillStyle = '#555';
                    windGameCtx.fillRect(turbine.x - 5, turbine.y - 100, 10, 100);
                    
                    // Nacelle
                    windGameCtx.fillStyle = '#333';
                    windGameCtx.fillRect(turbine.x - 10, turbine.y - 110, 20, 10);
                    
                    // Blades (rotating)
                    windGameCtx.save();
                    windGameCtx.translate(turbine.x, turbine.y - 105);
                    windGameCtx.rotate(turbine.rotation);
                    
                    windGameCtx.fillStyle = '#666';
                    for (let i = 0; i < 3; i++) {
                        windGameCtx.save();
                        windGameCtx.rotate(i * Math.PI * 2 / 3);
                        windGameCtx.beginPath();
                        windGameCtx.moveTo(0, 0);
                        windGameCtx.lineTo(0, -5);
                        windGameCtx.lineTo(40, -5);
                        windGameCtx.lineTo(40, 5);
                        windGameCtx.lineTo(0, 5);
                        windGameCtx.closePath();
                        windGameCtx.fill();
                        windGameCtx.restore();
                    }
                    
                    windGameCtx.restore();
                    
                    // Update rotation if game is running
                    if (windGameRunning) {
                        turbine.rotation += 0.05 * Math.cos(windDirection - turbine.direction);
                    }
                });
                
                // Draw score
                windGameCtx.fillStyle = 'black';
                windGameCtx.font = '20px Arial';
                windGameCtx.fillText(`Score: ${windScore}`, 20, 30);
                
                if (windGameRunning) {
                    requestAnimationFrame(drawWindGame);
                    calculateWindScore();
                }
            }
            
            function calculateWindScore() {
                // Simple scoring based on turbine placement and wind direction
                windScore = windTurbines.reduce((total, turbine) => {
                    // Score based on alignment with wind
                    const alignmentScore = 50 * (1 - Math.abs(windDirection - turbine.direction) / Math.PI);
                    
                    // Penalty for placing turbines too close
                    let proximityPenalty = 0;
                    windTurbines.forEach(other => {
                        if (other !== turbine) {
                            const distance = Math.sqrt(
                                Math.pow(other.x - turbine.x, 2) + 
                                Math.pow(other.y - turbine.y, 2)
                            );
                            if (distance < 80) {
                                proximityPenalty += 20;
                            }
                        }
                    });
                    
                    return total + Math.max(0, alignmentScore - proximityPenalty);
                }, 0);
                
                windGameScore.textContent = `Energy Production: ${Math.round(windScore)} MW`;
            }
            
            windStartBtn.addEventListener('click', function() {
                if (!windGameRunning) {
                    windGameRunning = true;
                    drawWindGame();
                    this.textContent = 'Pause Game';
                    
                    // Change wind direction periodically
                    setInterval(() => {
                        windDirection = Math.random() * Math.PI * 2;
                    }, 5000);
                } else {
                    windGameRunning = false;
                    this.textContent = 'Resume Game';
                }
            });
            
            windResetBtn.addEventListener('click', function() {
                windGameRunning = false;
                windStartBtn.textContent = 'Start Game';
                windTurbines = [];
                windScore = 0;
                windDirection = 0;
                drawWindGame();
                windGameScore.textContent = 'Place wind turbines to maximize energy production while minimizing environmental impact!';
            });
            
            // Place turbines on click
            windGameCanvas.addEventListener('click', function(e) {
                if (!windGameRunning) {
                    const rect = windGameCanvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    
                    // Only place on "land"
                    if (mouseY > 200 + Math.sin(mouseX / 50) * 50) return;
                    
                    windTurbines.push({
                        x: mouseX,
                        y: mouseY,
                        rotation: 0,
                        direction: Math.random() * Math.PI * 2
                    });
                    
                    drawWindGame();
                }
            });
            
            // Initial draw
            drawWindGame();